# EECS4481

Instructions to run the  Helpdesk application on kali:

1) This application needs to have node installed (by default it is installed in kali), Node JS status can be check by running by "node -v". 

2) clone the repository to a folder by running the cmd "git clone https://github.com/Harsh-B-Patel/HelpDeskApp -b main"

3) run "npm install" in the directory with package.json, this will install all the dependencies and setup the application. 

Note : In the case step 3 does not work you will have to do "npm audit fix --force" in the directory with package.json. Then follow the step mentioned above. 

After Step 3, all the dependecies should have been installed and the application should be ready to run. 

4) The application can be started running "npm run start" in the directory with package.json. 

5) The application is hosted at localhost:3000.

Note : This application can also be accessed by 2nd kali VM, by entering vm1's ipaddr:3000 in the browser.  
