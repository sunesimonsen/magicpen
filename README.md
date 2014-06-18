```js
var magicpen = require('magicpen')
magicpen.setOutput('ansi color');

magicpen.keyword('Person').space().operator('{').nl()
        .indent()
            .key('name').operator(':').space().string("'Sune Simonsen'").nl()
            .key('age').operator(':').space().number(34).nl()
            .key('kids').operator(':').space().operator('[').string("'Svea Skude Simonsen'").operator(']').nl()
        .outdent()
        .operator('}')

console.log(magicpen.toString());
```


```js
Person {
    name: 'Sune Simonsen',
    age: 34,
    kids: ['Svea Skude Simonsen']
}
```

```js
magicpen.addStyle('ansi color', 'red', function (text) {
    magicpen.write('\x1B[31m' + text + '\x1B[39m');
});

magicpen.addStyle('html', 'red', function (text) {
    magicpen.write('<span style="color: red">' + text + '</span>');
});

magicpen.addStyle('error', function (text) {
    magicpen.red(text);
});
```
