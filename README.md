[![Build Status](https://travis-ci.org/mapbox/geojson-mapnikify.svg)](https://travis-ci.org/mapbox/geojson-mapnikify)

# geojson-mapnikify

Transform [GeoJSON](http://geojson.org/) objects into [Mapnik](http://mapnik.org/)
XML stylesheets with embedded GeoJSON data and [simplestyle-spec](https://github.com/mapbox/simplestyle-spec)-derived
styles.

## install

As a dependency:

    npm install --save geojson-mapnikify

As a binary:

    npm install -g geojson-mapnikify

## api

Assumptions:

* GeoJSON is valid, and in EPSG:4326
* Styles, if any, are expressed in simplestyle-spec
* Mapnik 2.x is the rendering engine

## binary

If you install `-g`, you can use `geojson-mapnikify` as a binary that takes
a single GeoJSON file as an argument and writes a Mapnik XML stylesheet
to stdout.

```
$ geojson-mapnikify test/data/point-retina.geojson > stylesheet.xml
$ geojson-mapnikify test/data/point-retina.geojson retina > stylesheet-retina.xml
```

### `mapnikify(geojson, retina, callback)`

Transform GeoJSON into Mapnik XML.

* `geojson` is a GeoJSON object.
* `retina` is true or false for whether the style should be optimized for 2x rendering.
* `callback` called with `(err, xml)` where xml is a string
