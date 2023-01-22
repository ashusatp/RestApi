import { Product } from "../models";
// npm i --save multer
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";

const storage = multer.diskStorage({
    destination: (req,file, cb) =>{
        cb(null,'uploads/');
    },
    filename: (req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random()* 1E9)}${path.extname(file.originalname)}`
        // 333385464618-465465465.png
        cb(null, uniqueName);
    }

});

const handleMultipartData = multer({storage , limits: {fileSize: 1000000* 5}}).single('image') //5mb

const productController = {
    async store(req,res,next){
        //multipart form data
        handleMultipartData(req,res, async(err)=>{
            if(err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            const filePath = req.file.path
            // validate request
            const productSchema = Joi.object({
                name: Joi.string().required(),
                price: Joi.number().required(),
                size: Joi.string().required(),
            });
          
            const { error } = productSchema.validate(req.body);
            if (error) {
                // Delete the uploaded file
                fs.unlink(`${appRoot}/${filePath}`,(err)=>{
                    if(err){
                        return next(CustomErrorHandler.serverError(err.message));
                    }
                })
                //rootFolder/uploads/filename.png
                return next(error);
            }


            const {name,price,size} = req.body;
            let document;

            try{

                document =  await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                })

            }catch(error){
                return next(err);
            }

            res.status(201).json(document);
        });

    }
}

export default productController;