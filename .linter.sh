#!/bin/bash
cd /home/kavia/workspace/code-generation/burning-man-camp-dues-tracker-30861-07b251f8/burning_man_camp_dues_tracker
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

