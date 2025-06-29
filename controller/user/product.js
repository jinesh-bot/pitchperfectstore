const express = require('express');
const Product = require('../../model/productmodel');
const Category = require('../../model/categorymodel');

const productController = {
    getProducts: async (req, res) => {
        try {
            const { category, view, brand, minPrice, maxPrice, sort } = req.query;
            
            // Build query
            let query = { status: 'active' };
            
            if (view === 'new-arrivals') {
                query.isNewArrival = true;
            } else if (category) {
                query.category = category.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }

            if (brand) query.brand = brand;
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }

            // Build sort options
            let sortOption = {};
            switch (sort) {
                case 'price-low':
                    sortOption = { price: 1 };
                    break;
                case 'price-high':
                    sortOption = { price: -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                case 'rating':
                    sortOption = { rating: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }

            // Fetch products
            const products = await Product.find(query)
                .sort(sortOption)
                .select('name price images category rating isNewArrival discount');

            // Page metadata
            let pageTitle = 'Our Products';
            let pageDescription = 'Discover our premium football gear collection';

            if (view === 'new-arrivals') {
                pageTitle = 'New Arrivals';
                pageDescription = 'Check out our latest products';
            } else if (category) {
                pageTitle = query.category;
                pageDescription = `Explore our ${pageTitle} collection`;
            }

            // Get all categories for sidebar
            const categories = await Category.find().sort({ name: 1 });
            const brands = await Product.distinct('brand');

            res.render('user/products', {
                products,
                categories,
                brands,
                selectedCategory: category,
                view,
                pageTitle,
                pageDescription,
                user: req.session.user || null,
                currentSort: sort || 'newest'
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    getProductDetail: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).render('user/404', { message: 'Product not found' });
            }
            res.render('user/product-detail', { 
                product,
                user: req.session.user || null
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    // Add more controller methods as needed
};

module.exports = productController; 