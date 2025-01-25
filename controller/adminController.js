
const userModel=require("../model/usermodel.js");
const { log } =require ("mercedlogger");
const bcrypt =require ("bcrypt")


const addusers = async (req, res) => {
    try {
        const {email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new userModel({email, password: hashedPassword })


        await newUser.save()

        res.redirect('/admin/home')
    } catch (error) {
        log.red("ERROR", error)
        res.redirect('/admin/home')
    }
}

const deleteUser = async (req, res) => {
    try {

        const id = req.params.id
        
        await userModel.findByIdAndDelete(id)
        res.redirect('/admin/home')
    } catch (error) {
        log.red("ERROR",error)
    }
}


const editUser = async (req,res)=>{
    try{
        const id = req.params.id
        const { email, password} = req.body
        if(!password){ 
            await userModel.findOneAndUpdate({_id:id}, {$set:{email}})
        }else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await userModel.findOneAndUpdate({_id:id}, {$set:{email, password: hashedPassword}})
        }
        res.redirect('/admin/home')

    }catch(error){
        log.red("ERROR", error)
    }
}

module.exports= { addusers, deleteUser, editUser }