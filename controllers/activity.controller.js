import Users from '../models/user.model.js';
import axios from "axios";
import { findUserById, DB_DATA  } from './users.js';

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

export const startActivity = async (req, res) => {
  const userId = req.params.id;
  const activityName = req.body.activityName;

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check for any ongoing activities and update them
    user.activities.forEach(activity => {
      const ongoingInstance = activity.instances.find(instance => instance.status === "ongoing");
      if (ongoingInstance) {
        //if (activity.name === activityName) return res.status(210).json({ message: 'activity already started' });
        ongoingInstance.status = "completed";
        ongoingInstance.endTime = new Date().toISOString();
      }
    });


    let activity = user.activities.find(act => act.name === activityName);


    // Create new Activity instance
    const newActivityInstance = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: "ongoing"
    }
    activity.instances.push(newActivityInstance);
    console.log(activity);

    // Update the user's activities in the database
    const updateResponse = await axios.post('action/updateOne', {
      ...DB_DATA,
      filter: { "id": userId },
      update: {
        "$set": {
          "activities": user.activities
        }
      }
    });

    res.status(200).json({ message: 'Activity started successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


  export const endActivity = async(req, res) => {
    const userId = req.params.id;
    const activityName = req.body.activityName;

    try {
      const user = await findUserById(userId);

      if (!user) {
        return res.status(404).json({message: 'User not found.'});
      }

      const activity = user.activities.find(act => act.name === activityName);

      if(!activity) {
        return res.status(404).json({message: 'Activity not found.'});
      }


      const ongoingInstance = activity.instances.find(instance => instance.status === "ongoing");
      if (!ongoingInstance) {
        return res.status(400).json({message: 'the provided activity has no ongoing instances'});
      }
      ongoingInstance.endTime = new Date().toISOString();
      ongoingInstance.status = "completed";
      const updateResponse = await axios.post('action/updateOne', {
        ...DB_DATA,
        filter: { "id": userId },
        update: {
          "$set": {
            "activities": user.activities
          }
        }
      });

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

export const getCurrentActivity = async (req, res) => {
  const userId = req.params.id;// Assuming you have user's ID in request

  try {
    const user = await findUserById(userId); // Implement findUserById to retrieve user data by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentActivity = user.activities.find(activity =>
        activity.instances.some(instance => instance.status === 'ongoing'));

    if (currentActivity) {
      return res.status(200).json({ currentActivity: currentActivity.name });
    } else {
      return res.status(200).json({ currentActivity: "" });
    }
  } catch (error) {
    console.error("Error fetching current activity:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};



