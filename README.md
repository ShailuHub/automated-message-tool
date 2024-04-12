<h1>ReachInbox</h1>

<p>ReachInbox is a tool that connects to your Gmail accounts using OAuth authentication, reads incoming emails, understands their context using OpenAI, assigns automatic labels based on the content, and sends automated replies accordingly.</p>

<h2>Features</h2>

<ul>
    <li>Connect new email accounts for both Google using OAuth authentication.</li>
    <li>Read incoming emails to the connected accounts.</li>
    <li>Categorize emails based on their content and assign labels:</li>
    <ul>
        <li>Interested</li>
        <li>Not Interested</li>
        <li>More Information</li>
    </ul>
    <li>Suggest appropriate responses based on the email content and send out replies:</li>
    <ul>
        <li>If the email indicates interest, suggest scheduling a demo call by proposing a time.</li>
    </ul>
</ul>


<h2>Installation</h2>

<ul>
    <li>Clone the repository: <pre><code>git clone https://github.com/your-username/reach-inbox.git</code></pre></li>
</ul>
<ul>
  <li>Navigate to the project directory: <pre><code>cd reach-inbox</code></pre></li>
    
</ul>
<ul>
  <li>Install dependencies: <pre><code>npm install</code></pre></li>
    
</ul>
    
<h2>Configuration</h2>

<p>Create a <code>.env</code> file in the project root directory:</p>
clientId=your_google_client_secret
clientSecret=your_outlook_client_secret
openaiId=your_openai_api_key</code></pre>

<p>Replace <code>your_google_client_id</code>, <code>your_google_client_secret</code>, <code>your_google_refresh_token</code>, <code>your_outlook_client_id</code>, <code>your_outlook_client_secret</code>, <code>your_outlook_refresh_token</code>, and <code>your_openai_api_key</code> with your actual credentials obtained from the respective services.</p>

<h2>Usage</h2>

<ol>
    <li>Start the server:</li>
    <pre><code>npm start</code></pre>
    
    <li>Access the tool from your browser at <a href="http://localhost:3000">http://localhost:3000</a>.</li>
</ol>

<h2>Demo</h2>

<p>To showcase the working of this tool during the assignment review, follow these steps:</p>

<ol>
    <li>Connect new email accounts for both Google using OAuth authentication.</li>
    <li>Send an email to these accounts from another account.</li>
    <li>Observe the tool reading incoming emails to the connected accounts.</li>
    <li>Categorize the email based on the content and assign a label.</li>
    <li>Check the suggested response based on the email content and verify the automated reply.</li>
</ol>

<h2>Contributing</h2>

<p>Contributions are welcome! Please open an issue or submit a pull request.</p>
