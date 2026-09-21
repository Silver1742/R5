const express = require("express");
const { requireAuth } = require("../middleware/auth");
const tasks = require("../controllers/tasks.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/", tasks.list);
router.get("/:id", tasks.getOne);
router.post("/", tasks.create);
router.put("/:id", tasks.update);
router.delete("/:id", tasks.remove);

module.exports = router;
