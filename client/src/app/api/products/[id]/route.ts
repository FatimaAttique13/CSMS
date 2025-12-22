import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const updates: any = {};

    // Only include fields that are provided
    if (body.name !== undefined) updates.name = body.name;
    if (body.sku !== undefined) updates.sku = body.sku.toUpperCase();
    if (body.category !== undefined) updates.category = body.category;
    if (body.description !== undefined) updates.description = body.description;
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.unitPrice !== undefined) updates.unitPrice = body.unitPrice;
    if (body.taxRate !== undefined) updates.taxRate = body.taxRate;
    if (body.stockQuantity !== undefined) updates.stockQuantity = body.stockQuantity;
    if (body.reorderLevel !== undefined) updates.reorderLevel = body.reorderLevel;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Product updated successfully',
        product 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
