# geojson-mapnikify

Transform [GeoJSON](http://geojson.org/) objects into [Mapnik](http://mapnik.org/)
XML stylesheets with embedded GeoJSON data and [simplestyle-spec](https://github.com/mapbox/simplestyle-spec)-derived
styles.

## api

Assumptions:

* GeoJSON is valid, and in EPSG:4326
* Styles, if any, are expressed in simplestyle-spec
* Mapnik 2.x is the rendering engine

### `mapnikify(geojson, TMP, retina) -> { xml: stylesheet, resources: [] }`

Transform GeoJSON into Mapnik XML.

#### Input

* `geojson` is a GeoJSON object.
* `TMP` is a tmp directory path for marker resources
* `retina` is true or false for whether the style should be optimized for 2x rendering.

#### Output

* `xml` is the stylesheet
* `resources` is a list of paths of marker icons that are expected to be downloaded
  by another process
