# GraphView

I'm designing a framework for my Senior Thesis to abstract away the implementation of a network of nodes for the study of distributed algorithms. The goal is to allow a user to easily define how a node behaves, and then launch the network of nodes to visualize the algorithm running.

The project is split into two parts -  the core java application that will create a system of nodes that communicate with each other, and a webapp that will allow the user to easily configure the system and compare the results of different runs.

This is the repository for the webapp, the source code for the java application can be found here - https://github.com/speter52/GraphSim

## Components

The primary module will allow the user to enter his code into a text editor and then submit it to the server. If the code compiles, the server will run the application and display the console output to the client. If it doesn't compile, the line number where the error occured will be pointed out.

There's a second module to allow the user to specify how the network should be laid out. It will make it easy to rapidly create a large network of nodes under different configurations.

The final module is a way to compare the performances of different algorithms. The user can specify which state values and nodes should be selected from different algorithms, and then be able to visualize them side-by-side on an interactive graph. I've chosen DyGraphs to visualize the data since it is capable of handling large datasets quickly and efficiently.

## More Details to Follow....
