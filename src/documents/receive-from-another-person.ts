/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default `
# Step 0: Find a Sender

If you want to receive some Grin, you need to find someone who wants to send some Grin first. We will call this person "Sender".

# Step 1: Sender initiate the transaction 

On the main screen Sender needs to press "Send", then enter an amount, choose fee, enter an optional message, choose "Share as a file" and then share dialog would appear automatically. The app has generated a partial transaction file, which needs to be signed by a recipient (you). Sender now needs to share this file in any convinient (better secure) way, so you can open it on your phone.

# Step 2: Receive a partial transaction

When you've received the file from Sender, open it, press on Share icon and choose "Copy to Ironbelly". 

This will open the app, where you could check the amount and accept the transaction. If accepted, Ironbelly would sign the file and ask you to share it back with Sender. Do that and sit tight, we are not done yet!

# Step 3: Finalizing and posting to the chain 

When Sender have received the file from you, she would open it, press on Share icon and choose "Copy to Ironbelly". 

This will open the app, where Sender could check and post the transaction. If posted, it would take a couple of minutes until it appear in the chain.

# Step 4: Wait 10 confirmations

After the transaction has appeared in the chain it is still very fresh and Ironbelly would wait for 10 confirmations (10 - 20min) until it can be used. After that the funds are officially yours! 
#
`
