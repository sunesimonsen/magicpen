```js
var MagicPen = require('MagicPen')

var pen = new MagicPen('ansi');

pen.keyword('Person').sp().operator('{').nl()
        .indent()
            .key('name').operator(':').sp().string("'Sune Simonsen'").nl()
            .key('age').operator(':').sp().number(34).nl()
            .key('kids').operator(':').sp().operator('[').string("'Svea Skude Simonsen'").operator(']').nl()
        .outdent()
        .operator('}')

console.log(pen.toString());
```


```js
Person {
    name: 'Sune Simonsen',
    age: 34,
    kids: ['Svea Skude Simonsen'] // this is an
                                  // indented block
}
```

```js
pen.addStyle('error', function (text) {
    pen.red(text);
});
```
