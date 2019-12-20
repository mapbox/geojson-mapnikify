## changelog

## 3.0.1
- Allows up to one redirect for requests by default
- Allows either http or https requests for agent

## 3.0.0

- Node 10 support
- Swaps request with needle (may cause breaking changes if you use a custom client to customize request options)
- Uses agentkeepalive (https) for all requests

## 2.1.1

- Update agentkeepalive dependency to v4.0.2. This will prevent this. _evictSession error_

## 2.1.0

- Throw error with description if url marker is too large.

## 2.0.0

- Update to @mapbox/makizushi ^3.0.1
- Update to @mapbox/blend ^2.0.1
- Update to mapnik 3.x || 4.x

## 1.0.0

- Update to mapnik 3.7.0
- Update to blend 2.0.0
- Update to makizushi 2.0.0
- Drops windows support

### 0.8.0

- Update to mapnik 3.6.0

### 0.7.1

- Fix bug which tinted all url markers to #7e7e7e unless `marker-color` was specified.

### 0.7.0

- Updated mapnik to 3.5.0

### 0.5.0

- Updates node-agentkeepalive dependency to v2.0.2. This is a breaking change for node 0.8.x users.

### 0.4.3

 - Fixed handling of multipoint geometries
