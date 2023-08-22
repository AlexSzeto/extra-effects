## Quick Start

- start an effect with either of the create effect blocks in the `Create` section.
- try replacing the effect data shadow block with the fire spark block from the `Data` section. Try using other word combinations!
- for full customization, create an effect data object from scratch using the gigantc custom effect data block!

## Sample Project

A sample project is available here:
https://arcade.makecode.com/S25961-93672-24496-79526

## Tips and Tricks

- to create infinite effects, set the effect duration to a negative number.
- the two big settings for custom effect datas are the colors and sizes:
    - Both colors and sizes are number arrays. Any number array can be used, although putting random numbers into the color array is usually not very helpful.    
    - If there's already a good preset for color or size that you want to reuse, there are blocks to put those presets back into the custom effect data.
    - Over the lifetime of each particle it would cycle through each of the colors and sizes in the array from start to finish.
- The set/change blocks under the `Advanced Data` section can be used to tweak the preset effect data objects - just assign a preset object to a variable first.
- set a negative extra vy to make particles float, or add gravity to give particles weight.
- the wave radius setting usually requires extra vy or gravity to achieve its looks, but feel free to experiment!
- if in doubt, try it out! You can always change it back.

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/alexszeto/extra-effects** and import

#### Metadata (used for search, rendering)

* for PXT/arcade
