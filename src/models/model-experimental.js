/*
 * Factory function for creating "abstract stock" object. 
 */
const AbstractModel = function (options) {

  /**
   * Private properties :)
   * @see http://javascript.crockford.com/private.html
   */
  const companyList = [],
    priceTotal = 0;

  for (var companyName in options) {

    if (options.hasOwnProperty(companyName)) {
      companyList.push(companyName);
      priceTotal = priceTotal + options[companyName];
    }
  }

  return {
    /**
     * Privileged methods; methods that use private properties by using closure. ;)
     * @see http://javascript.crockford.com/private.html
     */
    getCompanyList: function () {
      return companyList;
    },
    getPriceTotal: function () {
      return priceTotal;
    },
    /*
     * Abstract methods
     */
    list: function () {
      throw new Error('list() method not implemented.');
    },
    total: function () {
      throw new Error('total() method not implemented.');
    }
  };
};

/*
 * Factory function for creating "stock" object.
 * Here, since the stock object is composed from abstract stock
 * object, you can make use of properties/methods exposed by the 
 * abstract stock object.
 */
const Model = compose(AbstractModel, function (options) {

  return {
    /*
     * More concrete methods
     */
    list: function () {
      console.log(this.getCompanyList().toString());
    },
    total: function () {
      console.log('$' + this.getPriceTotal());
    }
  };
});



// Create an instance of stock object. No `new`! (!)
const model = Model({ MSFT: 25.96, YHOO: 16.13, AMZN: 173.10 });
model.list(); // MSFT,YHOO,AMZN
model.total(); // $215.19

/*
 * No deep level of prototypal (or whatsoever) inheritance hierarchy;
 * just a flat object inherited directly from the `Object` prototype.
 * "What could be more object-oriented than that?" –Douglas Crockford
 */
console.log(model);



/*
 * Here is the magic potion:
 * Create a composed factory function for creating a composed object.
 * Factory that creates more abstract object should come first. 
 */
function compose(factory0, factoryN) {
  var factories = arguments;

  /*
   * Note that the `options` passed earlier to the composed factory
   * will be passed to each factory when creating object.
   */
  return function (options) {

    // Collect objects after creating them from each factory.
    var objects = [].map.call(factories, function (factory) {
      return factory(options);
    });

    // ...and then, compose the objects.
    return Object.assign.apply(this, objects);
  };
};


Model