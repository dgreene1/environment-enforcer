module.exports = {
  environmentEnforcer: {
    environmentsFolderPathRelativeToPackageJSON:
      '__fixtures__/errorCases/missing-custom-env-file/environments',
    stageNames: ['stage', 'mySpecialProd-likeEnvironment'],
  },
};
