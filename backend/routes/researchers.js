const express = require("express");
const router = express.Router();
const Model = require("../models/Researcher");
const Topic = require("../models/ResearchTopic");
router.get("/", async (req,res)=>{ try{res.json(await Model.find().sort({createdAt:-1}));}catch(e){res.status(500).json({message:e.message});} });
router.post("/", async (req,res)=>{ try{res.status(201).json(await Model.create(req.body));}catch(e){res.status(400).json({message:e.message});} });
router.put("/:id", async (req,res)=>{ try{const x=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Researcher not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});} });
router.delete("/:id", async (req,res)=>{ try{const x=await Model.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Researcher not found"});await Topic.updateMany({researchers:req.params.id},{$pull:{researchers:req.params.id}});for(const name of ["Publication","Dataset","FundingProject"])await require(`../models/${name}`).updateMany({researchers:req.params.id},{$pull:{researchers:req.params.id}});res.json({message:"Researcher deleted"});}catch(e){res.status(400).json({message:e.message});} });
module.exports=router;
