const fs = require('fs');
const path = require('path');
const pdfkit = require('pdfkit');

const Products = require('../models/products');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');

const stripe = require('stripe')('sk_test_51TQmiE20Z38bRuUS7Eow6I01VBvRQCyMXj3iMtG6RfYzeoKOQbdupHdAtQ7VEZfDL8WPAA02J7QelLd074mbQ7FU00CJfeLUTt');

exports.getIndex = (req,res,next) => {
    Products.findAll()
    .then(products => {
        res.render('shop/index', {
            prods: products,    
            pageTitle:"product-list",
            path:"/",
            isAuthenticated: req.session.isLoggedIn || false,
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
},
exports.getProducts = (req,res,next) => {
    Products.findAll()
    .then(products => {
        res.render('shop/product-list',
            {
                prods:products,
                pageTitle:"product-list",
                path:"/products",
                isAuthenticated:req.session.isLoggedIn || false
            });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
},
exports.getProduct = (req,res,next) => {
    const productId = req.params.productId;
    Products.findAll({
        where : {userId : productId}
    })
    .then(product => {
        if(product == null){
            return res.redirect('/');
        }else{
            res.render('shop/product-detail',
                {
                    prods:product,
                    pageTitle:"product-detail",
                    path:"/products",
                    isAuthenticated:req.session.isLoggedIn || false
                    });
                }
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
},
exports.getCart = (req,res,next) => {
    req.user.getCart()
  .then(cart => {
    if (!cart) {
      // No cart exists
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your cart..',
        products: [],
        isAuthenticated: req.session.isLoggedIn
      });
    }

    return cart.getProducts()
      .then(products => {
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your cart..',
          products: products,
          isAuthenticated: req.session.isLoggedIn
        });
      });
  })
  .catch(err => console.log(err));
};
exports.deleteCartItems = (req,res,next) => {
    const productId = req.body.productId;
    req.user.getCart()
    .then(cart => {
        return cart.getProducts({ where : {id:productId}})
    })
    .then(product => {
        const products = product[0];
        return products.cartProducts.destroy();
    })
    .then(result => {
        res.redirect('/cart');  
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
},
exports.addToCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;

  req.user.getCart()
    .then(cart => {
      if (!cart) {
        return req.user.createCart(); // ensure cart exists
      }
      return cart;
    })
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;

      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        // ✅ Product already exists → update quantity
        const oldQty = product.cartItem.quantity;
        const newQty = oldQty + 1;

        return product.setCartItem({ quantity: newQty });
      } else {

        return Products.findByPk(prodId)
          .then(product => {
            return fetchedCart.addProduct(product, {
              through: { quantity: 1 }
            });
          });
      }
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
},
exports.getCheckout = (req,res,next) => {
    let total = 0;
    let products;
    req.user.getCart()
  .then(cart => {
    if (!cart) {
      // No cart exists
      console.log('No cart exists');
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your cart..',
        products: [],
        isAuthenticated: req.session.isLoggedIn
      });
    }

 return cart.getProducts()
  .then(products => {
    console.log('in carts');

    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: products.map(p => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: p.title,
            description: p.description,
          },
          unit_amount: p.price * 100,
        },
        quantity: p.cartProducts.quantity,
      })),
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });
  })
  .then(session => {
    console.log("SESSION CREATED:", session); // 🔥 IMPORTANT

    let total = 0;

    return cart.getProducts().then(products => {
      products.forEach(p => {
        total += p.cartProducts.quantity * p.price;
      });

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id, // ✅ should work now
        isAuthenticated: req.session.isLoggedIn
      });
    });
  })
})
  .catch(err => {
    console.log("STRIPE ERROR:", err); // 🚨 THIS WILL SHOW REAL ISSUE
  });
},

exports.createOrder = (req,res,next) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return req.user.createOrder()
        .then(order => {
            const productsWithQuantity = products.map(product => {
                product.orderProducts = { quantity: product.cartProducts.quantity };
                return product;
            });
            return order.addProduct(productsWithQuantity);
        }).catch(err => {
            res.redirect('/500');
        });
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => (
        res.redirect('/orders')
    ))
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

},
exports.displayOrders = (req,res,next) => {
    req.user.getOrders({include:['products']})
    .then(order => {
        console.log(order);
        res.render('shop/orders',{
        path:'/orders',
        pageTitle:'Your Orders',
        order : order,
        isAuthenticated:req.session.isLoggedIn
    });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
},
exports.getCheckoutSuccess = (req,res,next) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return req.user.createOrder()
        .then(order => {
            const productsWithQuantity = products.map(product => {
                product.orderProducts = { quantity: product.cartProducts.quantity };
                return product;
            });
            return order.addProduct(productsWithQuantity);
        })
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => (
        res.redirect('/orders')
    ))
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

},
exports.getInvoice = (req,res,next) => {
    const orderId = req.params.orderId;
    Order.findByPk(orderId)
    .then(order => {
        if(!order)
        {
            return next(new Error('No order found'));
        }
        if(order.userId.toString() !== req.user.id.toString())
        {
            return next(new Error('unauthorized'));
        }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data','invoices',invoiceName);
    
    const pdfDoc = new pdfkit();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','inline;fileName="'+invoiceName+'"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice');
pdfDoc.text('--------------------------------');

let totalPrice = 0;

order.getProducts()
  .then(products => {
    products.forEach(p => {
      totalPrice += p.orderProducts.quantity * p.price;

      pdfDoc.text(
        p.title + ' - ' +
        p.orderProducts.quantity + ' x $' +
        p.price
      );
    });

    pdfDoc.text('--------------------------------');
    pdfDoc.text('Total price: $' + totalPrice);

    pdfDoc.end(); 
  })
})
  .catch(err => {
    console.log(err);
  });

}