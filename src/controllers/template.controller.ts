import { Request, Response, NextFunction } from "express";
import Template, { ITemplate } from "../models/template.model"
import { parse } from "url";
import { setState, checkState } from "../services/state";
import { getUserById } from "../services/user.services";
import { createTemplate } from "../services/template.services";

export const saveTemplate = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user_id;
  const user_account = await getUserById(userId)
  const { templateName, text } = req.body

  try {
    const template = await createTemplate({
      userId,
      templateName,
      text
    });
    res.status(201).json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user_id;
  const user_account = await getUserById(userId)

  if (user_account) {
    try {
      const templates = await Template.findByUserId(userId)
      res.status(200).json(templates)
    } catch (err) {
      next(err)
    }
  }
}
