

import axios from "axios";
import { findUserById, DB_DATA  } from './users.js';

export const createActivities = async(req, res) => {
  const userId = req.params.id;
  const activities = req.body.activities;

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found: User ID '+ userId});
    }

    if (user.activities.length === 0 && activities.length === 4) {
      user.activities = activities.map(activity => ({
        name: activity.name,
        color: activity.color,
        instances: [] // Initially empty
      }));
      const updateResponse = await axios.post('action/updateOne', {
      ...DB_DATA,
      filter: { "id": userId },
      update: {
        "$set": {
          "activities": user.activities
        }
      }
    });

      res.status(201).json({message: 'Activities created sucessfully.'});
    } else {
      res.status(400).json({message: 'Invalid request to create activities.'});
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error: ' + error});
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


// This is function to add an activity to user's activity list
export const logActivity = async (req, res) => {
  const userId = req.params.id;
  const newActivityInstance = req.body.activityInstance;
  const activityName = req.body.name;


  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    //Find the activity with the given name, and push the new instance.
    let activity = user.activities.find(act => act.name === activityName);
    activity.instances.push(newActivityInstance);
    console.log(`New Activity logged: ${activityName} by user ${user.login}`);

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

    res.status(200).json({ message: 'Activity logged successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
};

export const deleteInstance = async (req, res) => {
  const userId = req.params.id;
  const {startTime, endTime} = req.body.activityInstance;
  const activityName = req.body.name;


  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the activity with the given name
    const activity = user.activities.find(act => act.name === activityName);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    if (!activity.instances) {
      return res.status(404).json({ message: 'No instances found for this activity.' });
    }

    // Filter out the instance to delete
    const updatedInstances = activity.instances.filter(instance =>
        !(instance.startTime === startTime && instance.endTime === endTime)
    );

    user.activities = user.activities.map(act =>
        act.name === activityName ? { ...act, instances: updatedInstances } : act
    );

    // Update the user document with the modified activities array
    const updateResponse = await axios.post('action/updateOne', {
      ...DB_DATA,
      filter: { "id": userId },
      update: {
        "$set": {
          "activities": user.activities
        }
      }
    });

    if (updateResponse.status === 200) { // Assuming a 200 status for a successful update
      res.json({ message: 'Activity instance deleted successfully.' });
    } else {
      throw new Error('Failed to update user activities');
    }
  } catch (error) {
    console.error("Failed to delete activity instance:", error);
    res.status(500).json({ message: 'Failed to delete activity instance.' });
  }
};

export const editInstance = async (req, res) => {
  const userId = req.params.id;

  const {startTime, endTime} = req.body.oldActivityInstance;
  const oldActivityName = req.body.oldActivityName;

  const newActivityInstance = req.body.newActivityInstance;
  const newActivityName = req.body.newActivityName;


  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ------------------------
    // ----- DELETING OLD -----
    // ------------------------
    // Find the activity with the given name
    const oldActivity = user.activities.find(act => act.name === oldActivityName);

    if (!oldActivity) {
      return res.status(404).json({ message: 'Old activity not found.' });
    }

    if (!oldActivity.instances) {
      return res.status(404).json({ message: 'No instances found for this activity.' });
    }

    // Filter out the instance to delete
    const updatedInstances = oldActivity.instances.filter(instance =>
        !(instance.startTime === startTime && instance.endTime === endTime)
    );

    // Update the specific activity's instances within the user's activities array
    user.activities = user.activities.map(act =>
        act.name === oldActivityName ? { ...act, instances: updatedInstances } : act
    );

    // ----------------------
    // ----- ADDING NEW -----
    // ----------------------

    //Find the activity with the given name, and push the new instance.
    let activity = user.activities.find(act => act.name === newActivityName);
    activity.instances.push(newActivityInstance);
    console.log(`New Activity logged: ${newActivityName} by user ${user.login}`);

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

    if (updateResponse.status === 200) { 
      res.json({ message: 'Activity instance edited successfully.' });
    } else {
      throw new Error('Failed to update user activities');
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
};



