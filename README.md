# FormatD.HotspotEditor

Provides backend editor for Neos and some base fusion prototypes for drag and drop hotspots on any content.
This package is meant as base for concrete implementations of content elements.


### Installation

Don't install this package without an implementation package. Use it as base for your own package or
use `formatd/hotspot-content` (https://github.com/Format-D/FormatD.HotspotContent) for a concrete implementation of a `Image with Hotspots` content element.

```bash
composer require formatd/hotspot-content
```

### Compile Backend Editor

```bash
cd Resources/Private/Scripts/HotspotEditor && yarn && yarn build
```

### Compatibility

Versioning Scheme

     1.0.0 
     | | |
     | | Bugfix Releases (non breaking)
     | Neos Compatibility Releases (non breaking)
     Feature Releases

Releases & Compatibility

| Package Version | NEOS CMS Version | Notes                                                                 |
|-----------------|------------------|-----------------------------------------------------------------------|
| 1.1.x           | >= 8.3 < 9       |                                                                       |
| 2.0.x           | >= 8.3 < 9       | completely reworked structure compatible with formatd/hotspot-content |
