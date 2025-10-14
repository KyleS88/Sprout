**Study App - A Concept Mapping Tool**
A dynamic and interactive concept mapping application designed to help you build a personal **knowledge graph** for studying. Visualize and connect your ideas by creating, linking, and annotating concepts in a fluid, user-friendly interface. **Nodes** hold your concepts and terms, while **edges** represent the relationships that link them, allowing you to map out your ideas into a connected graph or tree.

> Stack: PostgreSQL · Express · React · Node
**About The Project**
This project is a full-stack web application that provides a digital canvas for users to create and manage concept maps. It's a powerful tool for studying, brainstorming, and organizing complex information. The front end is built with React and TypeScript, featuring a rich, interactive UI powered by React Flow. The back end is a robust Node.js and Express server, with a PostgreSQL database to persist user data.

Why this exists

Flashcards are great, but they miss relationships. This app lets you:
  -create concept nodes
  -connect them with edges containing notes
  -traverse your graph like a map of ideas
  
**Login/Register**

The application features a minimalistic and secure Login and Registration system. Built with React Bootstrap and React Router, the authentication pages send API requests to the Node.js backend, which then queries the PostgreSQL database for verification and retrieval of user information. For security, passwords are encrypted and hashed using **Bcrypt**. To ensure a seamless user experience, **JSON Web Tokens (JWT)** are used for authentication, allowing users to stay logged in even after refreshing the page, without needing to re-enter their credentials.

<img width="1206" height="710" alt="image" src="https://github.com/user-attachments/assets/373a5cd9-84d3-41ce-b015-9656494868c3" />
<img width="1216" height="981" alt="image" src="https://github.com/user-attachments/assets/31e44e40-8d3d-4bfc-8871-4e56778b2d81" />

**Creating and Connecting Ideas**

Once logged in, you are presented with an interactive canvas powered by React Flow. Here, you can:
  -Create Nodes: Simply click "Add Term" to place a new concept on your map. You can add a title directly on the node.
  -Form Edges: Click and drag from the handles of one node to another to create a visual connection, representing the relationship between two ideas.
  -Add Detailed Notes: Select any node or edge to open up the notes panel. Here you can write detailed explanations, definitions, or any other information relevant to the concept or its connection.

<img width="2547" height="1237" alt="image" src="https://github.com/user-attachments/assets/9d018fdb-4904-4dbf-834e-f92fb193a2fe" />  

Adding a term initializes an empty node on the canvas, which can then be updated with a concept and a corresponding note.
<img width="2559" height="1233" alt="image" src="https://github.com/user-attachments/assets/b713e064-ba1b-4e7d-b446-0deefa992a93" />




  

