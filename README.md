# HelpDeskApp

Developed a web based help desk chat application, with chat rooms, auto customer-admin assignment, admin authentication and many admin-only features that can be used to resolve customer’s issues.

![unknown](https://user-images.githubusercontent.com/46072683/167728746-1d0b4ab1-a02d-4a21-9c78-b08ff7aca475.png)

![unknown (1)](https://user-images.githubusercontent.com/46072683/167728755-7f1e5a91-8660-4538-a6ed-8eb86651d1b6.png)

![unknown (2)](https://user-images.githubusercontent.com/46072683/167728762-48aea6a8-0c38-4ce4-8be4-6635f6f0f486.png)

Instructions to run the  Helpdesk application on kali:

1) This application needs to have node installed (by default it is installed in kali), Node JS status can be check by running by "node -v". 

2) Clone the repository to a folder by running the cmd "git clone https://github.com/Harsh-B-Patel/HelpDeskApp -b main".

3) Run "npm install" in the directory with package.json, this will install all the dependencies and setup the application. 

Note : In the case step 3 does not work you will have to do "npm audit fix --force" in the directory with package.json. Then follow the step mentioned above. 

After Step 3, all the dependecies should have been installed and the application should be ready to run. 

4) The application can be started running "npm run start" in the directory with package.json. 

5) The application is hosted at localhost:3000.


