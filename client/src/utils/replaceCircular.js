const replaceCircular = function (val, cache) {
  cache = cache || new WeakSet();

  if (val && typeof val == 'object') {
    console.log(val);
    if (cache.has(val)) return '[Circular]';

    cache.add(val);

    var obj = Array.isArray(val) ? [] : {};
    for (var idx in val) {
      obj[idx] = replaceCircular(val[idx], cache);
    }

    cache.delete(val);
    return obj;
  }

  return val;
};

export default replaceCircular;
