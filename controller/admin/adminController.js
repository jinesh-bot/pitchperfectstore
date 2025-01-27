const User = require('../../model/usermodel.js');

const adminController = {
    getDashboard: async (req, res) => {
        try {
            // Add any dashboard data you need
            res.render('admin/dashboard', {
                admin: req.session.admin,
                isLoginned: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    getProducts: async (req, res) => {
        try {
            // Add product data fetching logic
            res.render('admin/products', {
                admin: req.session.admin,
                isLoginned: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    getCategories: async (req, res) => {
        try {
            // Add category data fetching logic
            res.render('admin/categories', {
                admin: req.session.admin,
                isLoginned: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    getCustomers: async (req, res) => {
        try {
            const users = await User.find({}, 'name email isBlocked');
            console.log('Fetched users:', users);
            res.render('admin/customers', {
                admin: req.session.admin,
                users: users,
                isLoginned: true
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Server Error');
        }
    }
};

module.exports = adminController; 