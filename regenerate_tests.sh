#!/bin/sh

./bin/geojson-mapnikify test/data/example.geojson --normalize > test/data/example.xml
./bin/geojson-mapnikify test/data/point.geojson --normalize > test/data/point.xml
./bin/geojson-mapnikify test/data/point-retina.geojson --normalize --retina > test/data/point-retina.xml
./bin/geojson-mapnikify test/data/example-retina.geojson --normalize --retina > test/data/example-retina.xml
