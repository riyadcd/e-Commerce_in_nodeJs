const Products = require('../models/products');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

exports.getAddProduct = (req,res,next) =>{
    if(!req.session.isLoggedIn)
    {
        return res.redirect('/login');
    }
    res.render('admin/edit-product',
        {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            editing:false,
            errorMessage: req.flash('error'),
            isAuthenticated:req.session.isLoggedIn,
            oldInput: { title: '', imageUrl: '', description: '', price: ''},
            validationErrors:  [],
        });
},
exports.storeAddProduct = (req,res,next) => {
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req);
    if(!image){
        return res.status(422).render('admin/edit-product',{
                        pageTitle:"Add Product",
                        path:"/admin/add-product",
                        editing:false,
                        isAuthenticated:req.session.isLoggedIn,
                        errorMessage: 'Attatched image should be of the type png or jpg',
                        oldInput: { title: title, description: description, price: price},
                        validationErrors: [],
                });
    }
    if(!errors.isEmpty())
        {
                return res.status(422).render('admin/edit-product',{
                        pageTitle:"Add Product",
                        path:"/admin/add-product",
                        editing:false,
                        isAuthenticated:req.session.isLoggedIn,
                        errorMessage: errors.array()[0].msg,
                        oldInput: { title: title, description: description, price: price},
                        validationErrors:  errors.array(),
                });
        }
        const imageUrl = image.path;
    req.user . createProduct({
        title:title,
        price:price,
        imageUrl:imageUrl,
        description:description,
    })
    .then(result => {
        res.redirect('/admin/products');
    }).catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
    
},
exports.getEditProduct = (req,res,next) => {
    const editMode = req.query.edit;
    const pId = req.params.productId;
    Products.findByPk(pId)
    .then(product => {
        if(!editMode){
            redirect('/');
        }
        if(product == null){
            return res.redirect('/');
        }else{
            res.render('admin/edit-product',{
            pageTitle:"Edit Product",
            path:"" ,
            editing : editMode,
            prods : product,
            oldInput: { title: '', imageUrl: '', description: '', price: ''},
            validationErrors:  [],
            isAuthenticated:req.session.isLoggedIn,
            errorMessage:req.flash('error')
            });
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
exports.storeEditProduct = (req,res,next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    const errors = validationResult(req);
    if(!errors.isEmpty())
        {
            Products.findByPk(productId)
            .then(prods => {
                return res.status(422).render('admin/edit-product',{
                        pageTitle:"Edit Product",
                        path:"/admin/add-product",
                        editing:true,
                        prods: prods,
                        isAuthenticated:req.session.isLoggedIn,
                        errorMessage: errors.array()[0].msg,
                        oldInput: { title: updatedTitle, description: updatedDescription, price: updatedPrice},
                        validationErrors:  errors.array()
                });
            })
    
        }
    Products.findByPk(productId)
    .then(product => {
        if(image){
            fileHelper.deteteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.title = updatedTitle;
        product.description = updatedDescription;
        product.price = updatedPrice;
        return product.save();
    })
    .then(resulr => {
        res.redirect('/admin/products');
    })
    .catch(err =>         
        {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });    
}
exports.getProducts = (req,res,next) => {
    req.user.getProducts()
    .then(products => {
        res.render('admin/products',{
            prods:products,
            pageTitle:"Admin Products",
            path:"/admin/products",
            isAuthenticated:req.session.isLoggedIn
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
exports.deleteProduct = (req,res,next) => {
    const productId = req.body.productId;
    if(productId !== req.user.id)
    {
        return res.redirect('/');
    }
    Products.findByPk(productId)
    .then(product => {
        fileHelper.deteteFile(product.imageUrl);
        return product.destroy();
    })
    .then(result => {
        res.redirect('/admin/products');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}