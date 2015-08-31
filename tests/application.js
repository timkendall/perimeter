import should from 'should';

describe('application', function() {

  it('should exist', function () {
    require.resolve('../app/application').should.not.throw();
  });

});