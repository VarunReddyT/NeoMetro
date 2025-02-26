require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const {Suprsend,WorkflowTriggerRequest} = require("@suprsend/node-sdk");


const supr_client = new Suprsend(process.env.SUPRSEND_WORKSPACE_KEY, process.env.SUPRSEND_WORKSPACE_SECRET);

function hmac_rawurlsafe_base64_string(distinct_id, secret) {
    const hash = crypto
        .createHmac("sha256", secret)
        .update(distinct_id)
        .digest("base64url");
    return hash.trimEnd("=");
}

router.post('/subsId_generate', (req, res) => {
    const { distinct_id } = req.body;
    const secret = process.env.SUPRSEND_INBOX_SECRET;
    if (!secret) {
        return res.status(400).send('Input is required');
    }
    try{
      const subsId = hmac_rawurlsafe_base64_string(distinct_id, secret);  
      res.status(200).send(subsId);
    }
    catch(err){
        res.status(500).send('Error generating subsId. Please try again.');
    }
}
);

router.post('/trigger', async (req, res) => {
    const {distinct_id,source,destination} = req.body;
    const workflow_payload = {
        "workflow": process.env.SUPRSEND_WORKFLOW_NAME,
        "recipients": [
          {
            "distinct_id": distinct_id,
          }
        ],
        "data":{
          "first_name": "User",
          "source": source,
          "destination": destination
        }
    }
    const wf = new WorkflowTriggerRequest(workflow_payload)

    try {
      const response = await supr_client.workflows.trigger(wf);
      console.log("response", response);
      res.status(202).json({ status: 'success', data: response });
  } catch (error) {
      console.error('Error triggering workflow:', error);
      res.status(500).json({ status: 'error', message: 'Failed to trigger workflow' });
  }
});


module.exports = router;