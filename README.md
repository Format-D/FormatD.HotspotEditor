# FormatD.HotspotEditor

Provides a backend editor for Neos and some base Fusion prototypes for drag-and-drop hotspots on any
content. This package is meant as a base for concrete implementations of content elements.


## Installation

Don't install this package without an implementation package. Use it as a base for your own package,
or use `formatd/hotspot-content` (https://github.com/Format-D/FormatD.HotspotContent) for a concrete
implementation of an `Image with Hotspots` content element.

```bash
composer require formatd/hotspot-content
```


## Compatibility

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
| 3.0.x           | >= 9.0           | Neos 9 compatibility                                                  |

See [CHANGELOG.md](CHANGELOG.md) for breaking changes and upgrade notes.


## Contribution

Please maintain a clean and consistent coding style.

To rebuild the assets (Node >= 24), run:

```bash
cd Resources/Private/Scripts/HotspotEditor
npm install
npm run build
# or:
npm run watch
```


## License

See [LICENSE](LICENSE) (MIT)
