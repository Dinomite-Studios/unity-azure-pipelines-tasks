## Build a Unity project using a Microsoft hosted agent

The process for building on a hosted agent is basically the same as with custom agents. There is only one thing we need to keep in mind: The Unity version required by our project might not be installed on the agent. You can always check out the software and tools intalled on hosted agents here:

[Hosted VS2017](https://github.com/Microsoft/azure-pipelines-image-generation/blob/master/images/win/Vs2017-Server2016-Readme.md)
[Hosted macOS](https://github.com/Microsoft/azure-pipelines-image-generation/blob/master/images/macos/macos-Readme.md)

So, let's get started.

### Create a new build pipeline

Open your Azure DevOps project and navigate to the Pipelines module. Then select **New -> New Build Pipeline**. In the first step you need to tell the pipeline where to get source code for your Unity project. Please complete this step according to your needs. For this example I am using source code hosted on Azure Repos.

![Create new pipeline (get source)](images/pipeline-new-pipeline-get-source.jpg)

Next we need to select a template for the build pipeline. If you have experience you might select one of the existing templates and build on top of it. For this example we'll use the empty template to start from scratch. Search in the search box for "empty" and select the **Empty pipeline** template.

![Create new pipeline (select template)](images/pipeline-new-pipeline-template.jpg)

Alright, we now have a new empty pipeline. Please enter a name for your build pipeline (I named it "Unity Build Pipeline Hosted Agent" for this example). Also select the agent pools to use. I am going to use **Hosted VS2017** here.

![Create new pipeline (set name and agent)](images/pipeline-new-pipeline-name.jpg)
