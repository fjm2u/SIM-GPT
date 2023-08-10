## SIM-GPT
SIM-GPT is a multi-agent conversation simulation framework with GPT.
Current state of this software is a prototype.

PRs are welcome.

![SIM-GPT1](/assets/sim1.png)![SIM-GPT2](/assets/sim2.png)![SIM-GPT3](/assets/sim3.png)


### How to use
Currently, we don't provide a binary.
You need to build from source code.

1. Git clone
2. Type ```yarn install```
3. Type ```yarn start```
4. Happy hacking :-)

### Demo (Japanese)
[![SIM-GPT Demo](http://img.youtube.com/vi/k68gC9RpDd8/0.jpg)](https://www.youtube.com/watch?v=k68gC9RpDd8)

### Features
- Prompts and contexts can be edited in the UI.
- Project export/import is supported.
- Save results as a JSON file.

### Limitations
- Currently, the process is "listen -> speak".
- The number of people in the conversation is limited to two.
- Currently, it only works synchronously.

### ToDo
- [ ] Implement a conversation with three or more people.
- [ ] Implement the process of "listen -> **think** -> speak".
- [ ] Encrypt API key.

### Acknowledgments
This software is developed in the context of the LLM and MAS workshop that held in University of Aizu.
I would like to thank the organizers of the workshop for giving me the opportunity to participate in the workshop.

### Disclaimer
This software is provided as is, without any warranty.
Use at your own risk.
I assume no responsibility for any damage caused by using this software.
