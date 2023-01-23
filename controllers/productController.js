import { Product } from "../models";
// npm i --save multer
import multer from "multer";
import fs from "fs";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";
import productSchema from "../Validators/productValidator";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 333385464618-465465465.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); //5mb

const productController = {
  async store(req, res, next) {
    //multipart form data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      let filePath

      if (req.file.path.includes("\\")) {
        const first = req.file.path.split("\\");
        let path = "";
        for (var item of first) {
          if (!path) {
            path = path + item;
          } else {
            path = path + `/${item}`;
          }
        }
        filePath = path;
      }else{
        filePath = req.file.path;
      }
      // const first = req.file.path.split("\\")[0];
      // const second = req.file.path.split("\\")[1];
      // const filePath = `${first}/${second}`;
      // validate request
      //   const productSchema = Joi.object({
      //     name: Joi.string().required(),
      //     price: Joi.number().required(),
      //     size: Joi.string().required(),
      //   });

      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploaded file
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        //rootFolder/uploads/filename.png
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;

      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (error) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      // validate request
      //   const productSchema = Joi.object({
      //     name: Joi.string().required(),
      //     price: Joi.number().required(),
      //     size: Joi.string().required(),
      //   });

      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploaded file
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        //rootFolder/uploads/filename.png
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;

      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );
      } catch (error) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  async destroy(req, res, next) {
    let document;
    try {
      document = await Product.findOneAndRemove({ _id: req.params.id });
      if (!document) {
        return next(new Error("Nothing to delete"));
      }
      // image delete
      const first = document.image.split("uploads");
      let imagePath = `uploads${first[1]}`;

      fs.unlink(`${appRoot}/${imagePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
      });
    } catch (err) {
      return next(err);
    }
    res.json(document);
  },

  async index(req, res, next) {
    let documents;
    //pagination (mongoose pagination)
    try {
      documents = await Product.find();
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }

    return res.json(documents);
  },
};

export default productController;
