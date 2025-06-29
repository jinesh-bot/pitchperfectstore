const Product = require('../../model/productmodel');
const fs = require('fs').promises; // Use promises version
const path = require('path');
const Category = require('../../model/categorymodel');

const productController = {
    // Get all products or filtered by category
    getProductsByCategory: async (req, res) => {
        try {
            const { category } = req.query;
            let query = {};
            
            if (category) {
                query.category = category;
            }

            const products = await Product.find(query).sort({ createdAt: -1 });
            const categories = await Category.find().sort({ name: 1 });
            
            res.render('admin/products', { 
                products,
                categories,
                currentCategory: category || 'All Products',
                message: req.flash('message')
            });
        } catch (error) {
            console.error(error);
            req.flash('message', 'Error loading products');
            res.redirect('/admin/dashboard');
        }
    },

    // Show add product form
    showAddProduct: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 1 });
            const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Other'];
            
            res.render('admin/add-product', {
                categories,
                brands,
                message: req.flash('message')
            });
        } catch (error) {
            console.error(error);
            req.flash('message', 'Error loading form');
            res.redirect('/admin/products');
        }
    },

    // Add new product
    addProduct: async (req, res) => {
        try {
            const {
                name,
                description,
                price,
                category,
                brand,
                stock,
                isNewArrival,
                isFeatured,
                sizes,
                sizeQuantities,
                colors,
                colorCodes
            } = req.body;

            // Handle image uploads
            const images = Array.isArray(req.files) 
                ? req.files.map(file => `/uploads/products/${file.filename}`)
                : [];

            // Process sizes
            const processedSizes = sizes ? sizes.map((size, index) => ({
                size,
                quantity: parseInt(sizeQuantities[index]) || 0,
                available: parseInt(sizeQuantities[index]) > 0
            })) : [];

            // Process colors
            const processedColors = colors ? colors.map((color, index) => ({
                color,
                colorCode: colorCodes[index] || '#000000',
                available: true,
                images: [] // You can add color-specific images later if needed
            })) : [];

            const product = new Product({
                name,
                description,
                price,
                category,
                brand,
                images,
                stock: parseInt(stock),
                isNewArrival: isNewArrival === 'on',
                isFeatured: isFeatured === 'on',
                sizes: processedSizes,
                colors: processedColors
            });

            await product.save();
            req.flash('message', 'Product added successfully');
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Error adding product:', error);
            // If there's an error, remove uploaded files
            if (Array.isArray(req.files)) {
                await Promise.all(req.files.map(file => 
                    fs.unlink(file.path).catch(console.error)
                ));
            }
            req.flash('message', error.message || 'Failed to add product');
            res.redirect('/admin/products/add');
        }
    },

    // Show edit product form
    showEditProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            const categories = await Category.find().sort({ name: 1 });
            const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Other'];
            res.render('admin/edit-product', {
                product,
                categories,
                brands
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const {
                name,
                description,
                price,
                category,
                brand,
                stock,
                isNewArrival,
                isFeatured
            } = req.body;

            const updateData = {
                name,
                description,
                price,
                category,
                brand,
                stock: parseInt(stock),
                isNewArrival: isNewArrival === 'on',
                isFeatured: isFeatured === 'on'
            };

            // Handle new image uploads
            if (Array.isArray(req.files) && req.files.length > 0) {
                // Get old product to delete old images
                const oldProduct = await Product.findById(req.params.id);
                if (oldProduct?.images) {
                    // Delete old image files
                    await Promise.all(oldProduct.images.map(image => {
                        const imagePath = path.join('public', image);
                        return fs.unlink(imagePath).catch(console.error);
                    }));
                }
                // Add new images
                updateData.images = req.files.map(file => `/uploads/products/${file.filename}`);
            }

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!product) {
                return res.status(404).send('Product not found');
            }

            req.flash('message', 'Product updated successfully');
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            // If there's an error, remove uploaded files
            if (Array.isArray(req.files)) {
                await Promise.all(req.files.map(file => 
                    fs.unlink(file.path).catch(console.error)
                ));
            }
            req.flash('message', error.message || 'Error updating product');
            res.redirect('/admin/products');
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                req.flash('message', 'Product not found');
            } else {
                req.flash('message', 'Product deleted successfully');
            }
            res.redirect('/admin/products');
        } catch (error) {
            console.error(error);
            req.flash('message', 'Error deleting product');
            res.redirect('/admin/products');
        }
    }
};

module.exports = productController; 