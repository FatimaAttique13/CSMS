import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User.js';

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build query
    const query: any = {};
    
    if (customerId) {
      query.customer = customerId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const orders = await Order.find(query)
      .populate('customer', 'email profile')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { orders, count: orders.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    let { customerId, customerEmail, items, deliveryAddress, deliveryETA, metadata } = body;

    // Resolve customer by email if id is not provided
    if (!customerId && customerEmail) {
      try {
        const customer = await User.findOne({ email: String(customerEmail).toLowerCase() }).select('_id');
        if (customer) {
          customerId = customer._id;
        } else {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          );
        }
      } catch (e) {
        console.error('Lookup customer by email failed:', e);
        return NextResponse.json(
          { error: 'Failed to resolve customer' },
          { status: 500 }
        );
      }
    }

    // Validate required fields
    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and items are required' },
        { status: 400 }
      );
    }

    // Validate and prepare order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product "${product.name}" is currently unavailable` },
          { status: 400 }
        );
      }

      // Check if product is out of stock
      if (product.stockQuantity === 0) {
        return NextResponse.json(
          { error: `Product "${product.name}" is out of stock` },
          { status: 400 }
        );
      }

      // Check if requested quantity exceeds available stock
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { 
            error: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} ${product.unit} available, but ${item.quantity} ${product.unit} requested.` 
          },
          { status: 400 }
        );
      }

      const lineTotal = product.unitPrice * item.quantity;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        unit: product.unit,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        lineTotal
      });

      // Update product stock
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: customerId,
      status: 'Pending',
      items: orderItems,
      subtotal: 0, // Will be calculated by pre-validate hook
      tax: 0,
      total: 0,
      deliveryAddress: deliveryAddress || {},
      deliveryETA,
      timeline: [{
        status: 'Pending',
        at: new Date(),
        note: 'Order created'
      }],
      paymentStatus: 'unpaid',
      metadata: metadata || {}
    });

    // Populate customer info
    await order.populate('customer', 'email profile');

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
