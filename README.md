HeartoHelp.us
=============

Heartohelp.us is social site that helps Users ( Venters) share, talk and deliberate your problems/issues with other users, Listeners anonymously. Listeners and Venters have the option of being paired in a Chat randomly based on their initial choices, Chat topic/Age/Location (alpha).
Visit us on our forums: http://forum.heartohelp.us

Messages are sent with Socket.io event and persisted in MongoDB.
Bans/Report Abuse features are self-regulatory, with a geometrically increasing time-out.


Requirements
------------
* Node.js >= v0.6.2
* MongoDB and Redis installed and running.

Installation & Run
------------------
* git clone git://github.com/bassrehab/heartohelp.us.git
* cd heartohelp.us
* Do Not ! npm install. Custom dependencies are pre-included in H2h-core
* Set up Mongo/Redis
* Run app.js

Configuring
-----------
Edit all your requisite configurations in config.js. Config.json supercedes config.js. For Mongo/Redis authentication use appropriate syntax. Other config variables should not be changed.


Running
-------
* node app
or
* node app your_own_config.js

In Progress
-----------
* EveryAuth based Login/Profile System
* Re-implement Hubble (AI) Troll detection based on BigData, InfiniteGraph (Hadoop)
* Android implementation
* Dial-in using Twilio.



Special Mentions
----------------
* Rizka Pramadita/Treya 
* Sethu/Megastar 
* Mods and members of the H2H/CP Community ( forum.heartohelp.us)


Links
-----

 [mainsite] [1] , [forum] [2] or [more-codes] [3].

  [1]: http://heartohelp.us/        "HeartoHelp"
  [2]: http://forum.heartohelp.us/  "HeartoHelp Forum "
  [3]: http://raeng.pro/    "RAENG"



