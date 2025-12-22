import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/orders/[id]
 * Get a single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate('customer', 'email profile')
      .populate('items.product', 'name sku');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status or other fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { status, paymentStatus, deliveryETA, cancellationReason, note } = body;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (status) {
      order.status = status;
      
      // Add to timeline
      order.timeline.push({
        status,
        at: new Date(),
        note: note || `Order status changed to ${status}`
      });

      // Update relevant dates
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
      } else if (status === 'Cancelled') {
        order.cancelledAt = new Date();
        if (cancellationReason) {
          order.cancellationReason = cancellationReason;
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (deliveryETA) {
      order.deliveryETA = new Date(deliveryETA);
    }

    await order.save();
    await order.populate('customer', 'email profile');

    return NextResponse.json(
      { 
        message: 'Order updated successfully',
        order 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel an order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Cancelled by user';

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 }
      );
    }

    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.timeline.push({
      status: 'Cancelled',
      at: new Date(),
      note: reason
    });

    await order.save();

    return NextResponse.json(
      { 
        message: 'Order cancelled successfully',
        order 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
