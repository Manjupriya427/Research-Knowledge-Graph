const express = require("express");
const router = express.Router();
const Model = require("../models/ResearchTopic");
router.get("/", async (req,res)=>{try{res.json(await Model.find().populate("researchers","name email department").sort({createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/", async (req,res)=>{try{res.status(201).json(await Model.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id", async (req,res)=>{try{const x=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate("researchers","name");if(!x)return res.status(404).json({message:"Topic not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id", async (req,res)=>{try{const x=await Model.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Topic not found"});for(const name of ["Publication","Dataset","FundingProject"])await require(`../models/${name}`).updateMany({topics:req.params.id},{$pull:{topics:req.params.id}});res.json({message:"Topic deleted"});}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
