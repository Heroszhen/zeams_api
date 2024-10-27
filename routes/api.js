const router = require('express').Router();
const multer = require('multer');
const upload = multer();
const auth = require('../src/middlewares/auth');

const testController = require('../src/controllers/api/TestController');
const userController = require('../src/controllers/api/UserController');
const conversationController = require('../src/controllers/api/ConversationController');

router.get("/test", testController.test);
//user
router.post("/login", userController.login);
router.use(auth.checkToken);
router.get("/users/profile", userController.getProfile);
router.patch("/users/profile", userController.editProfile);
router.post("/users/profile/photo", userController.editProfilePhoto);
router.get("/users/interlocutors", userController.getInterlocutors);
router.patch("/users/interlocutor/:id", userController.addInterlocutors);
router.delete("/users/:id/interlocutor/:id2", userController.deleteInterlocutors);
//conversation
router.get("/conversations/user/:id/interlocutor/:id2", conversationController.getConversations);
router.post("/conversations", conversationController.addConversation)

module.exports = router;