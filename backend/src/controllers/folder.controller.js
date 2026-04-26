import { Folder } from "../models/Folder.js";
import { Item } from "../models/Item.js";
import { History } from "../models/History.js";

export const getFolders = async (req, res) => {
  try {
    const parent = req.query.parent || null;
    const folders = await Folder.find({ parent }).sort({ name: 1 });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const newFolder = await Folder.create({
      name,
      parent: parent || null,
    });
    res.status(201).json({
      message: "Folder created successfully.",
      folder: newFolder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name, parent } = req.body;
    
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (parent !== undefined) updateData.parent = parent;

    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      updateData,
      { new: true }
    );
    if (!updatedFolder) {
      return res.status(404).json({ message: "Folder not found." });
    }
    res.status(200).json({
      message: "Folder updated successfully.",
      folder: updatedFolder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const recursivelyDeleteFolder = async (folderId) => {
  const subfolders = await Folder.find({ parent: folderId });
  for (const sub of subfolders) {
    await recursivelyDeleteFolder(sub._id);
  }
  await Item.deleteMany({ folder: folderId });
  await Folder.findByIdAndDelete(folderId);
};

export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }

    await recursivelyDeleteFolder(folderId);
    res.status(200).json({ message: "Folder and all contents deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
