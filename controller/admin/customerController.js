const userModel=require("../../model/usermodel.js");
const { log } =require ("mercedlogger");
const bcrypt =require ("bcrypt")




const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Toggle the isBlocked status
        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ 
            success: true, 
            isBlocked: user.isBlocked, 
            message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully' 
        });

    } catch (error) {
        log.red("ERROR", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports= {toggleUserStatus }