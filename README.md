Perimeter
=====

A modern (Node.js) video surveillance system. Supports multiple cameras (IP, HDMI, USB) as well as motion detection, facial recognition, and more.

## Goals
The goal is for this to be an alternative and more powerful surveillance system for people with existing setups and who are tired of their clunky DVR systems. Here are the features I hope to support - 

* Standard 24/7 video recording
* Support for existing IP cameras
* Smart motion detection
* External event API (for Smart Home integration)
* Push notifications for events
* Facial recognition (i.e "Bob just got home")
* License plate recognition

## v1.0.0 *(in development)*

This release will implement the *Basic Systems* pack.

### Recording System 

Take an *n* number of video streams and save recordings into 5min segments. **Note: User settings will reduce the amount of actual stored video drastically. For example, the user may choose to pass video through our basic motion filter to only save clips that have motion detected in them.**

### Garbage System

Delete video after an expiration date or storage limit is close to being reached.

### Filter System

These would be algorithms that the system could pass video through. Video not matching the filter would be discarded (unless picked up by another filter).

#### Basic Motion Filter

Simplistic motion detection. Options would include time to record before/after the motion was detected and throttle time (time to group multiple motions into same clip).


## Later *(planned)*

### Notification System

Send notifications (push, email, texts) on system events.

### More Filters

For example, we could have a license plate filter, that on motion, would try and pull a license plate from the frames.

### Decorator System

This system would allow information to be added to the video. For example, we could have a decorator that draws yellow boxes around moving objects. The goal would be to add value to the video. Note: We could also perhaps implement these on the client side later on.


## Installing

TODO

## Contributing

TODO
