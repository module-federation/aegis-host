var Iterable_listAllKeys = (function () {

  var
    Mixin,

    listAllKeys = function () {
      return Object.keys(this).join(", ");
    }
    ;

  Mixin = function () {
    this.list = listAllKeys;
  };

  return Mixin;

}());


var Iterable_computeTotal = (function (global) {

  var
    Mixin,

    currencyFlag,


    aggregateNumberValue = function (collector, key) {
      collector.value = (
        collector.value
        + parseFloat(collector.target[key], 10)
      );
      return collector;
    },
    computeTotal = function () {
      return [

        currencyFlag,
        Object.keys(this)
          .reduce(aggregateNumberValue, { value: 0, target: this })
          .value
          .toFixed(2)

      ].join(" ");
    }
    ;

  Mixin = function (config) {
    currencyFlag = (config && config.currencyFlag) || "";

    this.total = computeTotal;
  };

  return Mixin;

}(this));


var Stock = (function () {

  var
    Stock,

    createKeyValueForTarget = function (collector, key) {
      collector.target[key] = collector.config[key];
      return collector;
    },
    createStock = function (config) { // Factory
      return (new Stock(config));
    },
    isStock = function (type) {
      return (type instanceof Stock);
    }
    ;

  Stock = function (config) { // Constructor
    var stock = this;
    Object.keys(config).reduce(createKeyValueForTarget, {

      config: config,
      target: stock
    });
    return stock;
  };

  /**
   *  composition:
   *  - apply both mixins to the constructor's prototype
   *  - by delegating them explicitly via [call].
   */
  Iterable_listAllKeys.call(Stock.prototype);
  Iterable_computeTotal.call(Stock.prototype, { currencyFlag: "$" });

  /**
   *  [[Stock]] factory module
   */
  return {
    isStock: isStock,
    create: createStock
  };

}());


var stock = Stock.create({ MSFT: 25.96, YHOO: 16.13, AMZN: 173.10 });

/**
 *  both methods are available due to JavaScript's
 *  - prototypal delegation automatism that covers inheritance.
 */
console.log(stock.list());
console.log(stock.total());

console.log(stock);
console.dir(stock);
