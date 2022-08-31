# TSV

## TOFIX

When stringifying tabs on fields we change a tab for other character(s). When parsing if the string already had that character we don't want to change it to a tab.

**Solutions**:
+ Don't allow tabs at all
