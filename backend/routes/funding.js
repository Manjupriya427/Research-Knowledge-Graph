const express=require("express");const router=express.Router();const Model=require("../models/FundingProject");
router.get("/",async(req,res)=>{try{res.json(await Model.find().populate("researchers","name").populate("topics","title").sort({createdAt:-1}));}catch(e){res.status(500).json({message:e.message});}});
router.post("/",async(req,res)=>{try{res.status(201).json(await Model.create(req.body));}catch(e){res.status(400).json({message:e.message});}});
router.put("/:id",async(req,res)=>{try{const x=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!x)return res.status(404).json({message:"Funding project not found"});res.json(x);}catch(e){res.status(400).json({message:e.message});}});
router.delete("/:id",async(req,res)=>{try{const x=await Model.findByIdAndDelete(req.params.id);if(!x)return res.status(404).json({message:"Funding project not found"});res.json({message:"Funding project deleted"});}catch(e){res.status(400).json({message:e.message});}});
module.exports=router;
