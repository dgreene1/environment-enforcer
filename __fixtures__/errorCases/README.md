These files are not automatically tested by
[babel-plugin-tester's fixtures option](https://github.com/babel-utils/babel-plugin-tester#fixtures) unlike the success cases.

So if you add a file here, PLEASE add the case to [babel-plugin-tester's test option](https://github.com/babel-utils/babel-plugin-tester#tests) and specifically declare the expected error in the [error](https://github.com/babel-utils/babel-plugin-tester#error) property of the code in `src\environmentEnforcer.macro.spec.ts` (which is in our repo).
