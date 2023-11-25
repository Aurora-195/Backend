import Users from '../models/user.model.js';

export const createActivities = async(req, res) => {
  const userId = req.params.id;
  const activityNames = req.body.activityNames;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found.'});
    }

    if (user.activities.length === 0 && activityNames.length === 4) {
      user.activities = activityNames.map(name => ({name}));
      await user.save();

      res.status(201).json({message: 'Activities created sucessfully.'});
    } else {
      res.status(400).json({message: 'Invalid request to create activities.'});
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
  };
};

export const startActivity = async(req, res) => {
  const userId = req.params.id;
  const activityName = req.body.activityName;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found.'});
    }

    const activity = user.activities.find(act => act.name === activityName);
  
    if (!activity) {
      return res.status(404).json({message: ' Activity not found.'});
    }

    if (activity.startTime) {
      return res.status(400).json({message: 'Activity already started.'});
    }

    activity.startTime = new Date();
    await user.save();

    res.status(200).json({message: 'Activity started successfully.'});
  } catch(error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error.'});
  };
};

  export const endActivity = async(req, res) => {
    const userId = req.params.id;
    const activityName = req.body.activityName;

    try {
      const user = await Users.findById(userId);

      if (!user) {
        return res.status(404).json({message: 'User not found.'});
      }

      const activity = user.activities.find(act => act.name === activityName);

      if(!activity) {
        return res.status(404).json({message: 'Activity not found.'});
      }

      if (!activity.startTime || activity.endTime) {
        return res.status(400).json({message: 'Invalid request to end activity'});
      }

      activity.endTime = new Date();
      await user.save();

      res. status(200).json({message: 'Activity ended successfully.'});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Internal server error.'});
    };
  };

  export const editActivity = async(req, res) => {
    const userId = req.params.id;
    const activityName = req.body.activityName;
    const newActivityName = req.body.newActivityName;

    try {
      const user = await Users.findById(userId);

      if (!user) {
        return res.status(404).json({message: 'User not found.'});
      }

      const activity = user.activities.find(act => act.name === activityName);

      if (!activity) {
        return res.status(404).json({message: 'Activity not found.'});
      }

      if (!newActivityName) {
        return res.status(400).json({message: 'New activity name is required.'});
      }

      activity.name = newActivityName;
      await user.save();

      res.status(200).json({message: 'Activity edited successfully.'});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Internal server error.'});
    }
  };

  export const deleteActivity = async(req, res) => {
    const userId = req.params.id;
    const activityName = req.body.activityName;

    try {
      const user = await Users.findById(userId);

      if (!user) {
        return res.status(404).json({message: 'User not found'});
      }

      const activityIndex = user.activities.findIndex(act => act.name === activityName);

      if (activityIndex === -1) {
        return res.status(404).json({message: 'Activity not found.'});
      }

      user.activities.splice(activityIndex, 1);
      await user.save();

      res.status(204).json({message: "Activity deleted successfully."});
    } catch(error) {
      console.error(error);
      res.status(500).json({message: 'Internal server error.'});
    }
  };