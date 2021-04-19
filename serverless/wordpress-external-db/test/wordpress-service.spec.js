const {expect} = require('chai');
const WordPressService = require('../src/service/wordpress-service');
const {Uninitialized} = require('./commons/test-commons');

describe.skip('wordpress service', function () {

    this.timeout(5000)

    const env = {
        wordpressService: Uninitialized,
    }

    const ctx = {
        skip: Uninitialized,
        limit: Uninitialized,
    }

    before(() => {
        env.wordpressService = new WordPressService();
    });

    beforeEach(() => {
        ctx.skip = 0
        ctx.limit = 20
    });



    context('wordpress service', function () {

        it('check posts api', async () => {
            const resp = await env.wordpressService.retrievePosts(ctx.skip, ctx.limit)
            // console.log(resp[0])
            expect(resp).to.not.be.empty
        });

        it('check media api', async () => {
            const resp = await env.wordpressService.retrieveMedia(ctx.skip, ctx.limit)
            // console.log(resp[0])
            expect(resp).to.not.be.empty
        });

        it('check categories api', async () => {
            const resp = await env.wordpressService.retrieveCategories(ctx.skip, ctx.limit)
            // console.log(resp[0])
            expect(resp).to.not.be.empty
        });


        //
        //     it('should return false for an invalid member', async () => {
        //         expect(await membersReadServiceClient.isMember(aspects(), {email: randomEmail()})).to.deep.equal({member: false});
        //         expect(await membersReadServiceClient.isMember(aspects(), {username: randomString()})).to.deep.equal({member: false});
        //     });
        //
        //     it('should return false for an invalid request', async () => {
        //         expect(await membersReadServiceClient.isMember(aspects(), {})).to.deep.equal({member: false});
        //     });
        // });
        //
        // context('members-write-service', () => {
        //     it('should add a member with email and username', async () => {
        //         const member = new Member(randomEmail(), randomString());
        //
        //         givenUserMetadataExistsFor(member);
        //
        //         await membersWriteServiceClient.addMember(aspects(), {email: member.email});
        //
        //         expect(await membersDao.exists(member.email)).to.equal(true);
        //         expect(await membersDao.exists(member.username)).to.equal(true);
        //     });
        //
        //     it('should add a member with email only', async () => {
        //         const member = new Member(randomEmail(), randomString());
        //
        //         givenUserMetadataIsEmpty();
        //
        //         await membersWriteServiceClient.addMember(aspects(), {email: member.email});
        //
        //         expect(await membersDao.exists(member.email)).to.equal(true);
        //         expect(await membersDao.exists(member.username)).to.equal(false);
        //     });
        //
        //     it('should remove a member with email and username', async () => {
        //         const member = new Member(randomEmail(), randomString());
        //
        //         givenUserMetadataExistsFor(member);
        //         givenMemberExistsInCloudStore(member);
        //
        //         await membersWriteServiceClient.removeMember(aspects(), {email: member.email});
        //
        //         expect(await membersDao.exists(member.email)).to.equal(false);
        //         expect(await membersDao.exists(member.username)).to.equal(false);
        //     });
        //
        //     it('should remove a member with email only', async () => {
        //         const member = new Member(randomEmail(), randomString());
        //
        //         givenUserMetadataIsEmpty();
        //         givenMemberExistsInCloudStore(member);
        //
        //         await membersWriteServiceClient.removeMember(aspects(), {email: member.email});
        //
        //         expect(await membersDao.exists(member.email)).to.equal(false);
        //         expect(await membersDao.exists(member.username)).to.equal(true);
        //     });
        // });
        //
        // context('members-service-v2', () => {
        //     context('isMember should', () => {
        //         it('return true for a valid member', async () => {
        //             const member = new MemberV2(randomEmail(), randomString());
        //
        //             givenUserMetadataExistsFor(member);
        //             givenMemberV2ExistsInCloudStore(member);
        //
        //             expect(await membersServiceV2Client.isMember(aspects(), {email: member.email})).to.deep.equal({member: true});
        //             expect(await membersServiceV2Client.isMember(aspects(), {username: member.username})).to.deep.equal({member: true});
        //         });
        //
        //         it('return false for an invalid member', async () => {
        //             expect(await membersServiceV2Client.isMember(aspects(), {email: randomEmail()})).to.deep.equal({member: false});
        //             expect(await membersServiceV2Client.isMember(aspects(), {username: randomString()})).to.deep.equal({member: false});
        //         });
        //
        //         it('return false for an invalid request', async () => {
        //             expect(await membersServiceV2Client.isMember(aspects(), {})).to.deep.equal({member: false});
        //         });
        //     });
        //
        //     context('addMember should', () => {
        //         it('add a member with email and username', async () => {
        //             const member = new MemberV2(randomEmail(), randomString());
        //
        //             givenUserMetadataExistsFor(member);
        //
        //             await membersServiceV2Client.addMember(aspects(), {email: member.email});
        //
        //             expect(await membersDaoV2.exists(member.email)).to.equal(true);
        //             expect(await membersDaoV2.exists(member.username)).to.equal(true);
        //         });
        //
        //         it('add a member with email only', async () => {
        //             const member = new MemberV2(randomEmail(), randomString());
        //
        //             givenUserMetadataIsEmpty();
        //
        //             await membersServiceV2Client.addMember(aspects(), {email: member.email});
        //
        //             expect(await membersDaoV2.exists(member.email)).to.equal(true);
        //             expect(await membersDaoV2.exists(member.username)).to.equal(false);
        //         });
        //     });
        //
        //     context('removeMember should', () => {
        //         it('remove a member with email and username', async () => {
        //             const member = new MemberV2(randomEmail(), randomString());
        //
        //             givenUserMetadataExistsFor(member);
        //             givenMemberV2ExistsInCloudStore(member);
        //
        //             await membersServiceV2Client.removeMember(aspects(), {email: member.email});
        //
        //             expect(await membersDaoV2.exists(member.email)).to.equal(false);
        //             expect(await membersDaoV2.exists(member.username)).to.equal(false);
        //         });
        //
        //         it('remove a member with email only', async () => {
        //             const member = new MemberV2(randomEmail(), randomString());
        //
        //             givenUserMetadataIsEmpty();
        //             givenMemberV2ExistsInCloudStore(member);
        //
        //             await membersServiceV2Client.removeMember(aspects(), {email: member.email});
        //
        //             expect(await membersDaoV2.exists(member.email)).to.equal(false);
        //             expect(await membersDaoV2.exists(member.username)).to.equal(true);
        //         });
        //     });
    });

    // function aspects() {
    //     return testkit.apiGwTestkit.callContextBuilder().aspects();
    // }

    // function givenUserMetadataIsEmpty() {
    //     whenGrpcCalled(userMetadataStub.getByEmailLight)
    //         .withAny()
    //         .thenResolveWith({gitHubWixUser: null});
    // }
    //
    // function givenUserMetadataExistsFor(member) {
    //     const user = {
    //         gitHubWixUser: {
    //             email: member.email,
    //             username: member.username,
    //             blocked: false,
    //             whitelisted: false,
    //             fullName: ''
    //         }
    //     };
    //     whenGrpcCalled(userMetadataStub.getByEmailLight)
    //         .withArg({email: member.email})
    //         .thenResolveWith(user);
    //     return user.gitHubWixUser;
    // }
    //
    // function givenMemberExistsInCloudStore(member) {
    //     membersDao.put(member);
    // }
    // function givenMemberV2ExistsInCloudStore(member) {
    //     membersDaoV2.put(member);
    // }
});
