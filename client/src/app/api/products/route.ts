import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * GET /api/products
 * Get all products with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    // Build query - by default, only show active products
    const query: any = {};
    
    // Only show active products unless explicitly requesting inactive ones
    if (isActive === 'false') {
      query.isActive = false;
    } else if (isActive === 'all') {
      // Don't filter by isActive at all
    } else {
      // Default: only show active products
      query.isActive = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query).sort({ name: 1 });

    return NextResponse.json(
      { products, count: products.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, sku, category, description, unit, unitPrice, taxRate, stockQuantity, reorderLevel, isActive, metadata } = body;

    // Validate required fields
    if (!name || !sku || !category || !unit || unitPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, category, unit, unitPrice' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    // Create product
    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      category,
      description: description || '',
      unit,
      unitPrice,
      taxRate: taxRate !== undefined ? taxRate : 0.15,
      stockQuantity: stockQuantity || 0,
      reorderLevel: reorderLevel || 0,
      isActive: isActive !== undefined ? isActive : true,
      metadata: metadata || {}
    });

    return NextResponse.json(
      { 
        message: 'Product created successfully',
        product 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
