const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Football Boots', 'Jerseys', 'Footballs', 'Training Gear', 'Accessories', 'Track Pants', 'T-Shirts', 'Supplements']
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required'],
        enum: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Other']
    },
    images: [{
        type: String,
        required: [true, 'Product image is required']
    }],
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    sizes: [{
        size: String,
        available: {
            type: Boolean,
            default: true
        },
        quantity: {
            type: Number,
            default: 0
        }
    }],
    colors: [{
        color: String,
        colorCode: String,
        available: {
            type: Boolean,
            default: true
        },
        images: [String]
    }],
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        startDate: Date,
        endDate: Date
    },
    specifications: [{
        title: String,
        value: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'outOfStock'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create slug before saving
productSchema.pre('save', function(next) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    next();
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) return 0;
    
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    return this.rating;
};

// Method to check if product is on sale
productSchema.methods.isOnSale = function() {
    const now = new Date();
    return (
        this.discount.percentage > 0 &&
        this.discount.startDate <= now &&
        this.discount.endDate >= now
    );
};

// Method to get sale price
productSchema.methods.getSalePrice = function() {
    if (!this.isOnSale()) return this.price;
    
    const discountAmount = (this.price * this.discount.percentage) / 100;
    return this.price - discountAmount;
};

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isFeatured: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
