<!-- PROJECT SHIELDS -->


<br />
<div align="center">
<h2 align="center">CAPSTONE 770 - Team 6</h2>
<h3 align="center">EVolocity Prototype

</h3>


<img src="assets/evolocity_logo.png" alt="Team Peach Peacocks Logo" width="110"/>




<p align="center">
  <br />
  <br />
  <br />
<a href="https://github.com/ECSECapstone/capstone-project-2025-team_6/issues/new?labels=bug&template=bug-report.md">Report Bug</a>
·
<a href="https://github.com/ECSECapstone/capstone-project-2025-team_6/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
·
<a href="https://github.com/ECSECapstone/capstone-project-2025-team_6/issues/new?labels=documentation&template=documentation.md">Documention</a>




</div>
<br />








### Tech Stack Used

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?logo=springboot&logoColor=white&style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=for-the-badge)




<br />




## 1. Application Setup using Docker




### Prerequisites




- **Docker Desktop+**
  - Required to run the full application using Docker
  - [Download Docker](https://www.docker.com/products/docker-desktop)
  - After installation, make sure Docker is **running** in the background (look for the Docker whale icon in your system tray).



<br />

### Installation and Set up




1. **Clone the repo using Terminal/Command Prompt**:
   ```sh
   git clone https://github.com/ECSECapstone/capstone-project-2025-team_6.git
   ```

2. **Navigate to the project directory**:
   ```sh
   cd capstone-project-2025-team_6
   ```

3. **Ensure you copy the .env file (Importrant)**
  > Please make an .env file in the root of the directory (same level as LICENSE) and copy the env variables below:

   ```sh
   # Local MongoDB (used during race day)
LOCAL_MONGODB_URI=mongodb://mongo:27017
LOCAL_MONGODB_DB=capstone_db

# MongoDB Atlas (used after race day for upload)
ATLAS_MONGODB_URI=mongodb+srv://capstone770team6:jYE0oBKncodJjM6l@evolocity-cluster.1lqvvoy.mongodb.net/?retryWrites=true&w=majority&appName=evolocity-cluster
ATLAS_MONGODB_DB=capstone_db

USE_ATLAS=true

# Spring Boot Server
SERVER_PORT=8080

# CORS Origins
FRONTEND_DEV_URL=http://localhost:5173
BACKEND_DEV_URL=http://localhost:8080

   ```

4. **Build & Run the App**:

  ```sh
  # First time setup only: The --build flag ensures all Docker images are created correctly.
  # This may take several minutes depending on your internet speed and machine performance.
  docker compose up --build



  # NOTE: First time setup requires internet connection. Recommended to do this step prior


  # Subsequent use: You can just run: to start the app faster 
  docker compose up
  # only use --build again when you modify Dockerfiles or backend/frontend dependencies.
  # Subsequent use does not require internet connection
  ```
 > Access the App at: [http://localhost:5173](http://localhost:5173)



5. **Stopping the App**:

  ```sh
  CTRL + C # Gracefully shut down all services
  docker compose down # If you want to remove all running containers and networks
  ```
  > This will not delete your MongoDB data, it's stored in a named Docker volume (mongo-data) that persists between runs.



<br />




## 3. Cloud Collaboration using MongoDB Atlas




This project supports **two-way data sync** with **MongoDB Atlas**, allowing your team to collaborate and share data between devices.


### 🔼 Uploading to Atlas (Sync Local → Cloud)
To upload local MongoDB data to the cloud:




- Press **Upload to Atlas** in the app.
- This will:
- Overwrite existing Atlas records
- Replace team and competition data
- Reset ECU logs and race results




> **Warning:** Uploading will replace all existing data on Atlas with your current local copy.




#### 📶 Offline Uploads
If you’re **offline**, your upload will be **queued**:




- The app will retry uploading automatically when internet is restored.
- It remembers only the **latest Upload press**.
- If you make new changes while offline, press **Upload to Atlas** again to include them.
- You'll see a success message once the upload completes.




### 🔽 Syncing from Atlas (Cloud → Local)
Prompts to pull the latest data from Atlas into your local environment if it detects they are not synced:




- Press **Sync from Atlas** in the app.
- This will:
- Overwrite your **local data**
- Discard any **unsaved local changes**




> Be sure to back up or export local changes before syncing.




> **Note:** Syncing from Atlas requires an active internet connection.
> If you already know your device is out of sync, make sure to perform this action **in a location with internet access** (e.g., your office or home) **before heading to the race field**, where internet may be unavailable.




<br />


<!-- LICENSE -->
## License




Distributed under the MIT License. Read more at [MIT License](./LICENSE) for more information.








<!-- ACKNOWLEDGMENTS -->




## Acknowledgments
- [README Template](https://github.com/othneildrew/Best-README-Template?tab=readme-ov-file)
- [Image Shields](https://shields.io)
