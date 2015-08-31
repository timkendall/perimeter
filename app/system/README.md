# System

*This README is in-progress (other names - node-system, node-embedded?)*

System is a light-weight framework for crafting non-distibuted, real-time, embeded applications. It's goal is to enable the creation of predictable and resiliant applications composed of many subsystems. This is accomplished through the loosely coupled Pub/Sub pattern and child processes. If one subsystem goes down, the application can still recover.

*This is being developed specifically for Perimeter but the goal is to release it for general use at some point*

## Why

Traditional Node.js frameworks are aimed at a distributed architecture where they are deployed to the cloud and sit behind a load-balancer that can handle restarting applications if they fail. This is largely due to the fact that Node.js has until recently been used as primarily another backend language.

However with the rise of the IoT, Node.js has become an increasingly popular choice for interacting with hardware. Development boards such as the Raspberry Pi, NVIDIA Jetson, and Tessel have made it trivial and lucrative to develop Node.js applications that interact with hardware. Most of these hardware systems (think Quadcopters, smart devices, etc.) require resiliant and high-performing software that needs to run locally.

Furthermore, the relative ease of developing C/C++ modules for Node.js allows developers to enjoy the high-level, rich composibility of JavaScript while still being able to drop down into C/C++ land if needed.

I haven't found any frameworks that are aimed at this so this is why I am developing System - perhaps it will pave the path for more embeded systems to run on JavaScript.

## Usage

System exposes a minimal-surface area API that simply consists of a System, Subsystem, and Model class.

### System

The System class handles launching and monitoring subsytems.



### Subsystem

The Subsystem class represents a self-contained micro-system that runs arbitray code and interacts with other subsystems through events. A Subsystem is run as a child process so that it is able to be restarted and monitored by the parent System.

### Model