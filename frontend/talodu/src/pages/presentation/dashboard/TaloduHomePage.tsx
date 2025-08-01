import React, { useContext, useEffect, useState } from 'react';
import { useTour } from '@reactour/tour';
import useDarkMode from '../../../hooks/useDarkMode';
import { demoPagesMenu } from '../../../menu';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
    SubHeaderLeft,
    SubHeaderRight,
    SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import { TABS, TTabs } from './common/helper';
import Button, { ButtonGroup } from '../../../components/bootstrap/Button';

import CommonAvatarTeam from '../../../common/other/CommonAvatarTeam';

import CommonDashboardAlert from './common/CommonDashboardAlert';
import CommonDashboardUserCard from './common/CommonDashboardUserCard';
import CommonDashboardMarketingTeam from './common/CommonDashboardMarketingTeam';
import CommonDashboardDesignTeam from './common/CommonDashboardDesignTeam';
import CommonDashboardIncome from './common/CommonDashboardIncome';
import CommonDashboardRecentActivities from './common/CommonDashboardRecentActivities';
import CommonDashboardUserIssue from './common/CommonDashboardUserIssue';
import CommonDashboardSalesByStore from './common/CommonDashboardSalesByStore';
import CommonDashboardWaitingAnswer from './common/CommonDashboardWaitingAnswer';
import CommonMyWallet from '../../_common/CommonMyWallet';
import CommonDashboardTopSeller from './common/CommonDashboardTopSeller';
import ThemeContext from '../../../contexts/themeContext';
import { useAuth, AuthProvider } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import AllProductsDisplay from './AllProductsDisplay';

const TaloduHomePage = () => {
    const { mobileDesign } = useContext(ThemeContext);
    const {user, loading} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(user?.username) {
            //navigate('pages-login/login')
            console.log("The iser is:", user)
        }
    },[]);

/** 
    useEffect(() => {
        if (!loading && !user) {
          // Redirect if not logged in
    
          console.log("Going to login page... The user is", user);
          //console.log("The loading is", loading);
          //console.log("Getting user...");
                
         navigate('auth-pages/login');
        } else {
            console.log("Loading home page for ", user);
          console.log("The loading is", loading);
         // console.log("Getting user...");

        }
      }, [user, loading, navigate]);
*/

    /**
     * Tour Start
     */
    const { setIsOpen } = useTour();
    useEffect(() => {
        if (localStorage.getItem('tourModalStarted') !== 'shown' && !mobileDesign) {
            setTimeout(() => {
                setIsOpen(true);
                localStorage.setItem('tourModalStarted', 'shown');
            }, 7000);
        }
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { themeStatus } = useDarkMode();

    const [activeTab, setActiveTab] = useState<TTabs>(TABS.YEARLY);

    return (
        <PageWrapper title={demoPagesMenu.sales.subMenu.dashboard.text}>
            
            <Page container='fluid'>
                <div className='row'>
                    <div>
                        <AllProductsDisplay/>
                    </div>
                    
                
                </div>
            </Page>
        </PageWrapper>
    );
};

export default TaloduHomePage;